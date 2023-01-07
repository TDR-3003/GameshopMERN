import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import Steps from '../components/Steps';

export default function AddressScreen() {
  const navigate = useNavigate();
  const { state, dispatch: contextDispatch } = useContext(Store);
  const {
    fullBox,
    userLoggedIn,
    cart: { address },
  } = state;
  const [fullName, setFullName] = useState(address.fullName || '');
  const [streetAddress, setStreetAddress] = useState(
    address.streetAddress || ''
  );
  const [city, setCity] = useState(address.city || '');
  const [postalCode, setPostalCode] = useState(address.postalCode || '');
  useEffect(() => {
    if (!userLoggedIn) {
      navigate('/signin?redirect=/shipping');
    }
  }, [userLoggedIn, navigate]);
  const [country, setCountry] = useState(address.country || '');
  const submitHandler = (e) => {
    e.preventDefault();
    contextDispatch({
      type: 'SAVE_ADDRESS',
      payload: {
        fullName,
        streetAddress,
        city,
        postalCode,
        country,
      },
    });
    localStorage.setItem(
      'address',
      JSON.stringify({
        fullName,
        streetAddress,
        city,
        postalCode,
        country,
      })
    );
    navigate('/placeorder');
  };

  useEffect(() => {
    contextDispatch({ type: 'SET_FULLBOX_OFF' });
  }, [contextDispatch, fullBox]);

  return (
    <div>
      <Helmet>
        <title>Adres</title>
      </Helmet>

      <Steps step1 step2></Steps>
      <div className="container small-container">
        <h1 className="my-3">Adres</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="fullName">
            <Form.Label>Imię i nazwisko</Form.Label>
            <Form.Control
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="streetAddress">
            <Form.Label>Adres zamieszkania</Form.Label>
            <Form.Control
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>Miasto</Form.Label>
            <Form.Control
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="postalCode">
            <Form.Label>Kod pocztowy</Form.Label>
            <Form.Control
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="country">
            <Form.Label>Kraj</Form.Label>
            <Form.Control
              style={{ marginBottom: '35px' }}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button
              style={{
                backgroundColor: 'red',
                color: 'white',
                borderColor: 'red',
                marginBottom: '100px',
              }}
              variant="primary"
              type="submit"
            >
              Przejdź dalej
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
