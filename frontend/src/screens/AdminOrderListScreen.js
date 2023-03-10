import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        orders: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};
export default function AdminOrderListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userLoggedIn } = state;
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userLoggedIn.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userLoggedIn, successDelete]);

  const deleteHandler = async (order) => {
    if (window.confirm('Jeste?? pewien?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userLoggedIn.token}` },
        });
        toast.success('Zam??wienie usuni??te!');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Zam??wienia</title>
      </Helmet>
      <h4>Zam??wienia</h4>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table
          style={{
            backgroundColor: 'white',
            borderCollapse: 'separate',
            borderRadius: '6px',
            marginTop: '20px',
            marginBottom: '45px',
          }}
          className="table"
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>U??ytkownik</th>
              <th>Data z??o??enia</th>
              <th>Kwota</th>
              <th>P??atno???? zaksi??gowana</th>
              <th>Dostarczone</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : 'Usuni??ty'}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice.toFixed(2)}PLN</td>
                <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'Nie'}</td>

                <td>
                  {order.isDelivered
                    ? order.deliveredAt.substring(0, 10)
                    : 'Nie'}
                </td>
                <td>
                  <Button
                    className="buttonorder"
                    type="button"
                    variant="light"
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
                  >
                    Podgl??d
                  </Button>
                  &nbsp;
                  <Button
                    className="buttonorderdelete"
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(order)}
                  >
                    Usu??
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
