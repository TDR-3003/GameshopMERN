import Axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Store } from '../Store';
import CheckoutSteps from '../components/Steps';
import LoadingBox from '../components/LoadingBox';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function MakeOrderScreen() {
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: contextDispatch } = useContext(Store);
  const { cart, userLoggedIn } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  cart.taxPrice = round2(0.21 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });

      const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          address: cart.address,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userLoggedIn.token}`,
          },
        }
      );
      contextDispatch({ type: 'CART_EMPTY' });
      dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <Helmet>
        <title>Podsumowanie</title>
      </Helmet>
      <Row className="justify-content-center">
        <Col md={8}>
          <h3 className="my-3" style={{ alignItems: 'start' }}>
            Podsumowanie
          </h3>
          <Card className="mb-3" style={{ color: 'black' }}>
            <Card.Body>
              <Card.Title>Dane kupującego</Card.Title>
              <Card.Text>
                <strong>Imię i nazwisko:</strong> {cart.address.fullName} <br />
                <strong>Adres: </strong> {cart.address.address}
                <br></br>
                {cart.address.city}, {cart.address.postalCode}
                <br></br>
                {cart.address.country}
                <br></br>
                <Link to="/shipping">Edytuj</Link>
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="mb-3" style={{ color: 'black' }}>
            <Card.Body>
              <Card.Title>Przedmioty</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link
                          style={{ color: 'black', fontWeight: 'bold' }}
                          to={`/product/${item.slug}`}
                        >
                          {item.name}
                        </Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>{item.price}PLN</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link to="/cart">Edytuj</Link>
            </Card.Body>
          </Card>
          <Card style={{ marginBottom: '30px' }}>
            <Card.Body style={{ color: 'black' }}>
              <Card.Title>Koszty</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Suma</Col>
                    <Col>{cart.itemsPrice.toFixed(2)}PLN</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Koszty dostawy</Col>
                    <Col>{cart.shippingPrice.toFixed(2)}PLN</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>VAT</Col>
                    <Col>{cart.taxPrice.toFixed(2)}PLN</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Do zapłaty</strong>
                    </Col>
                    <Col>
                      <strong>{cart.totalPrice.toFixed(2)}PLN</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      style={{
                        backgroundColor: 'red',
                        color: 'white',
                        marginRight: '70px',
                        marginLeft: '70px',
                      }}
                      disabled={cart.cartItems.length === 0}
                    >
                      Złóż zamówienie
                    </Button>
                  </div>
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
