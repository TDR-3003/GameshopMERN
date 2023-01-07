import express from 'express';
import fetch from 'isomorphic-fetch';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isAdmin, mailgun, payOrderEmailTemplate } from '../utils.js';
import Big from 'big.js';

const orderRouter = express.Router();

orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    res.send(orders);
  })
);

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      address: req.body.address,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'Nowe zamówienie złożone!', order });
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Zamówienie nieznalezione!' });
    }
  })
);

orderRouter.put(
  '/:id/deliver',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: 'Zamówienie dostarczone!' });
    } else {
      res.status(404).send({ message: 'Zamówienie nieznalezione!' });
    }
  })
);

const getAccessToken = async () => {
  const response = await fetch(
    'https://secure.snd.payu.com/pl/standard/user/oauth/authorize',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&client_id=459163&client_secret=5fc1bfedfceaa4136a9b10b6394ae422',
    }
  );
  const data = await response.json();
  return data.access_token;
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
orderRouter.put(
  '/statuspayu',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const orderID = req.body.orderID;
      const accessToken = req.body.accessToken;
      console.log(orderID);
      console.log(accessToken);
      const response = await fetch(
        `https://secure.snd.payu.com/api/v2_1/orders/${orderID}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 200) {
        const order = await response.json();
        const orders = order.orders;
        const paymentStatus = orders[0].status;
        console.log('paymentStatus == ' + paymentStatus);
        if (paymentStatus === 'CANCELED') {
          res.send({ result: 'REJECTED' });
        } else if (paymentStatus === 'COMPLETED')
          res.send({ result: 'COMPLETED' });
      } else if (paymentStatus === 'PENDING') {
        res.send({ result: 'PENDING' });
      } else {
        res.send({ result: 'REJECTED' });
      }
    } catch (err) {
      console.log(err);
      res.send({ result: 'REJECTED' });
    }
  })
);

orderRouter.put(
  '/payu',
  expressAsyncHandler(async (req, res) => {
    const apiEndpoint = 'https://secure.snd.payu.com/api/v2_1/orders';

    const accessToken = await getAccessToken();
    const locationContinue = req.body.locationToContinue;
    const email = req.body.email;
    const name = req.body.firstName;
    const amount = req.body.amount;
    const bigAmount = new Big(amount);
    const hundreds = bigAmount.times(100);
    const price = hundreds.toFixed(0);
    console.log(price);
    const response = await fetch(
      'https://secure.snd.payu.com/api/v2_1/orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: 'Bearer 48a2cd02-7255-41cc-a943-44b2afe415d5',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          customerIp: '127.0.0.1',
          merchantPosId: '459163',
          description: 'RTV market',
          continueUrl: locationContinue + '?payment_try=true',
          currencyCode: 'PLN',
          totalAmount: price,
          buyer: {
            email: email,
            firstName: name,
            lastName: 'test',
            language: 'pl',
          },
          products: [
            {
              name: 'Wireless Mouse for Laptop',
              unitPrice: '15000',
              quantity: '1',
            },
            {
              name: 'HDMI cable',
              unitPrice: '6000',
              quantity: '1',
            },
          ],
        }),
      }
    );
    const redirectUrl = response.url;
    const url = new URL(redirectUrl);
    const orderID = url.searchParams.get('orderId');
    res.json({ redirectUrl, accessToken });
  })
);

orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name'
    );
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: 'COMPLETED',
        email_address: req.body.email,
      };
      console.log(order);
      const updatedOrder = await order.save();
      console.log('hehe');
      mailgun()
        .messages()
        .send(
          {
            from: 'Amazona <amazona@mg.yourdomain.com>',
            to: `${req.body.name} <${req.body.email}>`,
            subject: `New order ${order._id}`,
            html: payOrderEmailTemplate(order),
          },
          (error, body) => {
            if (error) {
              console.log(error);
            } else {
              console.log(body);
            }
          }
        );

      res.send({ message: 'Zamówienie opłacone!', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Zamówienie nieznalezione!' });
    }
  })
);

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.remove();
      res.send({ message: 'Zamówienie usunięte!' });
    } else {
      res.status(404).send({ message: 'Zamówienie nieznalezione!' });
    }
  })
);

export default orderRouter;
