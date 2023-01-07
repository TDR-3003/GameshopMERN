import axios from 'axios';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { Store } from '../Store';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT':
      return { ...state, product: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, product: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function ItemScreen() {
  let reviewsRef = useRef();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const [{ loading, error, product, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      product: [],
      loading: true,
      error: '',
    });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);

  const { state, dispatch: contextDispatch } = useContext(Store);
  const { cart, userLoggedIn } = state;
  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Przepraszamy, towar jest niedostępny!');
      return;
    }
    contextDispatch({
      type: 'CART_ADD_GAME',
      payload: { ...product, quantity },
    });
    navigate('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Liczba gwiazdek i treść nie mogą pozostać puste!');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment, name: userLoggedIn.name },
        {
          headers: { Authorization: `Bearer ${userLoggedIn.token}` },
        }
      );

      dispatch({
        type: 'CREATE_SUCCESS',
      });
      toast.success('Pomyślnie dodano opinię!');
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({ type: 'REFRESH_PRODUCT', payload: product });
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: 'CREATE_FAIL' });
    }
  };
  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Row>
        <Col md={(4, 5)}>
          <img
            style={{ margin: 'auto' }}
            className="card-img-top"
            src={product.image}
            alt={product.name}
          ></img>
        </Col>
        <Col md={1}></Col>
        <Col md={4} className="productdiv2" style={{ marginTop: '50px' }}>
          <ListGroup variant="light" style={{ marginBottom: '20px' }}>
            <ListGroup.Item className="productcard">
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h3>{product.name}</h3>
            </ListGroup.Item>
            <ListGroup.Item className="productcard">
              <div className="rating">
                <Rating
                  rating={product.rating}
                  numReviews={product.numReviews}
                ></Rating>
              </div>
            </ListGroup.Item>
            <ListGroup.Item className="productcard">
              <b>Cena</b> : {product.price}PLN
            </ListGroup.Item>
          </ListGroup>

          <ListGroup variant="light">
            <ListGroup.Item className="productcard">
              <Row>
                <Col className="col-3" style={{ width: '100%' }}>
                  Dostępność:
                </Col>
                <Col className="d-flex justify-content-center">
                  {product.countInStock > 0 ? (
                    <Badge
                      style={{
                        minWidth: '150px',
                      }}
                      bg="success"
                    >
                      Dostępny
                    </Badge>
                  ) : (
                    <Badge
                      style={{
                        minWidth: '150px',
                      }}
                      bg="danger"
                    >
                      Niedostępny
                    </Badge>
                  )}
                </Col>
              </Row>
            </ListGroup.Item>

            {product.countInStock > 0 && (
              <ListGroup.Item className="productcard">
                <div className="d-grid">
                  <Button
                    onClick={addToCartHandler}
                    variant="primary"
                    style={{ backgroundColor: 'red', color: 'white' }}
                  >
                    Dodaj do koszyka
                  </Button>
                </div>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Col>
      </Row>
      <Row>
        <Col md={8} className="productdiv2" style={{ marginTop: '50px' }}>
          <ListGroup variant="light" style={{ marginBottom: '20px' }}>
            <ListGroup.Item className="productcard">
              Opis:
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
      <div className="my-3">
        <h3 ref={reviewsRef}>Opinie</h3>
        <div className="mb-3">
          <Col md={8}>
            {product.reviews.length === 0 && (
              <MessageBox>Brak opinii</MessageBox>
            )}
          </Col>
        </div>
        <ListGroup>
          {product.reviews.map((review) => (
            <Col md={8}>
              <ListGroup.Item key={review._id}>
                <strong>{review.name}</strong>
                <div className="rating">
                  <Rating rating={review.rating} caption=" "></Rating>
                </div>
                <p>{review.createdAt.substring(0, 10)}</p>
                <p>{review.comment}</p>
              </ListGroup.Item>
            </Col>
          ))}
        </ListGroup>
        <div className="my-3">
          {userLoggedIn ? (
            <form onSubmit={submitHandler}>
              <h3>Napisz własną opinię:</h3>
              <Col md={8}>
                <Form.Group className="mb-3" controlId="rating">
                  <Form.Select
                    aria-label="Rating"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="">Wybierz ilość gwiazdek...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </Form.Select>
                </Form.Group>
                <FloatingLabel
                  controlId="floatingTextarea"
                  label="Treść"
                  className="mb-3"
                >
                  <Form.Control
                    as="textarea"
                    placeholder="Treść"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </FloatingLabel>
              </Col>
              <div className="mb-3">
                <Button disabled={loadingCreateReview} type="submit">
                  Dodaj
                </Button>
                {loadingCreateReview && <LoadingBox></LoadingBox>}
              </div>
            </form>
          ) : (
            <MessageBox>
              <Link to={`/signin?redirect=/product/${product.slug}`}>
                Zaloguj się
              </Link>{' '}
              , aby napisać opinię.
            </MessageBox>
          )}
        </div>
      </div>
    </div>
  );
}
export default ItemScreen;
