import React, { useContext, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

export default function UserScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userLoggedIn } = state;
  const [name, setName] = useState(userLoggedIn.name);
  const [email, setEmail] = useState(userLoggedIn.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Hasła muszą być takie same!');
      return;
    }
    try {
      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          password,
        },
        {
          headers: { Authorization: `Bearer ${userLoggedIn.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userLoggedIn', JSON.stringify(data));
      toast.success('Pomyślnie zaktualizowano dane użytkownika!');
    } catch (err) {
      dispatch({
        type: 'FETCH_FAIL',
      });
      toast.error(getError(err));
    }
  };

  return (
    <div className="small-container container">
      <Helmet>
        <title>Ustawienia</title>
      </Helmet>
      <h4>Ustawienia użytkownika</h4>
      <form onSubmit={submitHandler}>
        <Form.Group style={{ marginBottom: '10px' }} controlId="name">
          <Form.Label>Imię</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group style={{ marginBottom: '10px' }} controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group style={{ marginBottom: '10px' }} controlId="password">
          <Form.Label>Hasło</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group style={{ marginBottom: '20px' }} controlId="password">
          <Form.Label>Powtórz hasło</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <div style={{ marginBottom: '35px' }}>
          <Button type="submit">Potwierdź</Button>
        </div>
      </form>
    </div>
  );
}
