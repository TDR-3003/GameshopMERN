import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_SUCCESS_PAYU':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };

    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    default:
      return state;
  }
}
export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userLoggedIn } = state;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();
  const location = useLocation();

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    successPay: false,
    loadingPay: false,
  });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  const checkIfSuccess = async () => {
    var orderID = localStorage.getItem('CurrentOrderID');
    var accessToken = localStorage.getItem('CurrentAccessToken');
    const response = await axios.put(
      `/api/orders/statuspayu`,
      {
        orderID: orderID,
        accessToken: accessToken,
      },
      { headers: { Authorization: `Bearer ${userLoggedIn.token}` } }
    );
    const status = response.data.result;
    console.log(status);
    if (status === 'COMPLETED') {
      return 'COMPLETED';
    } else if (status === 'PENDING') {
      return status;
    } else {
      return 'REJECTED';
    }
  };

  const payuPayment = async () => {
    var orderID = localStorage.getItem('CurrentOrderID');
    const details = {
      id: orderID,
      email: userLoggedIn.email,
      name: userLoggedIn.name,
    };
    try {
      var orderGame = JSON.parse(localStorage.getItem('currentOrder'));
      dispatch({ type: 'PAY_REQUEST' });
      const { data } = await axios.put(
        `/api/orders/${orderGame._id}/pay`,
        details,
        {
          headers: { authorization: `Bearer ${userLoggedIn.token}` },
        }
      );
      dispatch({ type: 'PAY_SUCCESS', payload: data });
      toast.success('Opłacono zamówienie!');
    } catch (err) {
      dispatch({ type: 'PAY_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  function removeQuery() {
    const url = new URL(window.location.href);
    url.searchParams.delete('payment_try');
    window.history.pushState({}, '', url.toString());
  }

  const handlePayuPress = async () => {
    try {
      const locationURL =
        'https://gameshop-mern.herokuapp.com' + location.pathname;
      const response = await axios.put(`/api/orders/payu`, {
        locationToContinue: locationURL,
        amount: order.totalPrice.toFixed(2),
        email: userLoggedIn.email,
        firstName: userLoggedIn.name,
      });
      const redirectUrl = response.data.redirectUrl;
      const accessToken = response.data.accessToken;
      const url = new URL(redirectUrl);
      const orderID = url.searchParams.get('orderId');
      localStorage.setItem('CurrentAccessToken', accessToken);
      localStorage.setItem('CurrentOrderID', orderID);
      window.location.href = redirectUrl;
    } catch (err) {
      toast.error(getError(err));
      console.log(getError(err));
    }
  };

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        console.log(details);
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userLoggedIn.token}` },
          }
        );
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        toast.success('Opłacono zamówienie!');
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }
  function onError(err) {
    toast.error(getError(err));
  }
  useEffect(() => {
    if (window.location.search.includes('payment_try=true')) {
      const intervalId = setInterval(async () => {
        const status = await checkIfSuccess();
        if (status === 'COMPLETED') {
          await removeQuery();
          await payuPayment();
          clearInterval(intervalId);
        } else if (status === 'REJECTED') {
          await removeQuery();
          clearInterval(intervalId);
        }
      }, 4000);
    }
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userLoggedIn.token}` },
        });
        localStorage.setItem('currentOrder', JSON.stringify(data));
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (!userLoggedIn) {
      return navigate('/login');
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userLoggedIn.token}` },
        });
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'PLN',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPaypalScript();
    }
  }, [
    order,
    userLoggedIn,
    orderId,
    navigate,
    paypalDispatch,
    successPay,
    successDeliver,
  ]);

  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userLoggedIn.token}` },
        }
      );
      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      toast.success('Order is delivered');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'DELIVER_FAIL' });
    }
  }

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Zamówienie</title>
      </Helmet>
      <Row className="justify-content-center">
        <Col md={8}>
          <h3 className="my-3">Zamówienie id {orderId}</h3>
          <Card className="mb-3" style={{ color: 'black' }}>
            <Card.Body>
              <Card.Title>Kupujący</Card.Title>
              <Card.Text>
                <strong>Imię i nazwisko:</strong> {order.address.fullName}{' '}
                <br />
                <strong>Adres: </strong> {order.address.address}
                <br />
                {order.address.postalCode}, {order.address.city}
                <br />
                {order.address.country}
              </Card.Text>
              {order.isDelivered ? (
                <MessageBox variant="success">
                  Dostarczone {order.deliveredAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Nie dostarczone</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3" style={{ color: 'black' }}>
            <Card.Body>
              <Card.Title>Płatność</Card.Title>
              {order.isPaid ? (
                <MessageBox variant="success">
                  Opłacone {order.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Nie opłacone</MessageBox>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3" style={{ color: 'black' }}>
            <Card.Body>
              <Card.Title>Przedmioty</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>{item.price}PLN</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mb-5" style={{ color: 'black' }}>
            <Card.Body>
              <Card.Title>Podsumowanie</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Suma</Col>
                    <Col>{order.itemsPrice.toFixed(2)}PLN</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Koszty dostawy</Col>
                    <Col>{order.shippingPrice.toFixed(2)}PLN</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>VAT</Col>
                    <Col>{order.taxPrice.toFixed(2)}PLN</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Do zapłaty</strong>
                    </Col>
                    <Col>
                      <strong>{order.totalPrice.toFixed(2)}PLN</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {!order.isPaid && (
                  <ListGroup.Item>
                    {isPending ? (
                      <LoadingBox />
                    ) : (
                      <center>
                        <div style={{ maxWidth: '500px', marginTop: '10px' }}>
                          <Button
                            onClick={handlePayuPress}
                            className="payubutton"
                          >
                            <img
                              style={{
                                height: '60px',
                                paddingBottom: '22px',
                              }}
                              src="/images/payu.png"
                              alt="payu"
                            ></img>
                          </Button>
                        </div>
                        <div style={{ maxWidth: '500px' }}>
                          <PayPalButtons
                            style={{
                              color: 'blue',
                              shape: 'pill',
                            }}
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                          ></PayPalButtons>
                        </div>
                      </center>
                    )}
                    {loadingPay && <LoadingBox></LoadingBox>}
                  </ListGroup.Item>
                )}
                {userLoggedIn.isAdmin && order.isPaid && !order.isDelivered && (
                  <ListGroup.Item>
                    {loadingDeliver && <LoadingBox></LoadingBox>}
                    <div className="d-grid">
                      <Button type="button" onClick={deliverOrderHandler}>
                        Dostarcz
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
