import { useState, useContext, useEffect } from 'react';
import { Link, Route, BrowserRouter, Routes } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { Store } from './Store';
import { getError } from './utils';
import { LinkContainer } from 'react-router-bootstrap';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Badge from 'react-bootstrap/Badge';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import SearchField from './components/SearchField';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import AddressScreen from './screens/AddressScreen';
import SignupScreen from './screens/SignupScreen';
import MainScreen from './screens/MainScreen';
import ItemScreen from './screens/ItemScreen';
import AdminOrderListScreen from './screens/AdminOrderListScreen';
import AdminUserListScreen from './screens/AdminUserListScreen';
import AdminUserEditScreen from './screens/AdminUserEditScreen';
import MakeOrderScreen from './screens/MakeOrderScreen';
import OrderScreen from './screens/OrderScreen';
import AdminProductListScreen from './screens/AdminProductListScreen';
import AdminProductEditScreen from './screens/AdminProductEditScreen';
import UserOrderListScreen from './screens/UserOrderListScreen';
import UserScreen from './screens/UserScreen';
import SearchScreen from './screens/SearchScreen';

function App() {
  const { state, dispatch: contextDispatch } = useContext(Store);
  const { cart, userLoggedIn, fullBox } = state;

  const signoutHandler = () => {
    contextDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('address');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('payMethod');
    window.location.href = '/signin';
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetch();
  }, []);

  return (
    <BrowserRouter>
      <div
        className={
          sidebarOpen
            ? fullBox
              ? 'site-container active-cont d-flex flex-column full-box'
              : 'site-container active-cont d-flex flex-column'
            : fullBox
            ? 'site-container d-flex flex-column full-box'
            : 'site-container d-flex flex-column'
        }
      >
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <Navbar
            variant="dark"
            style={{ backgroundColor: '#25282a' }}
            expand="lg"
          >
            <Container>
              <Button
                style={{
                  backgroundColor: '#323638',
                  marginRight: '10px',
                  borderColor: '#323638',
                }}
                variant="dark"
                className="button-sidebar"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <i className="fas fa-bars"></i>
              </Button>

              <LinkContainer to="/">
                <Navbar.Brand>
                  <span style={{ color: 'red' }}>Game</span>
                  <span style={{ color: 'white' }}>shop</span>
                </Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <SearchField />
                <Nav
                  className="me-auto justify-content-end"
                  style={{ marginLeft: '5px', fontWeight: 'bold' }}
                >
                  <Link to="/cart" className="nav-link">
                    <div>
                      <span
                        className="nav-text"
                        style={{ position: 'relative' }}
                      >
                        Koszyk
                        {cart.cartItems.length > 0 && (
                          <Badge
                            className="d-inline-flex align-items-center text-center justify-content-start"
                            style={{
                              position: 'absolute',
                              top: '0.7rem',
                              left: '2.70rem',
                              width: '1rem',
                              height: '1rem',
                            }}
                            pill
                            bg="danger"
                          >
                            <span
                              style={{
                                position: 'absolute',
                                left: '0px',
                                textAlign: 'center',
                                width: '100%',
                                fontSize: '10px',
                              }}
                            >
                              {cart.cartItems.reduce(
                                (a, c) => a + c.quantity,
                                0
                              )}
                            </span>
                          </Badge>
                        )}
                      </span>
                    </div>
                  </Link>
                  {userLoggedIn ? (
                    <NavDropdown
                      className="dropdown-style"
                      variant="dark"
                      title={
                        <span className="nav-text">{userLoggedIn.name}</span>
                      }
                      id="basic-nav-dropdown"
                    >
                      <LinkContainer to="/profile">
                        <NavDropdown.Item className="dropdown-hov">
                          <span className="nav-text">Ustawienia konta</span>
                        </NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/orderhistory">
                        <NavDropdown.Item className="dropdown-hov">
                          <span className="nav-text">Historia zamówień</span>
                        </NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <Link
                        className="dropdown-item dropdown-hov"
                        to="#signout"
                        onClick={signoutHandler}
                      >
                        <span className="nav-text">Wyloguj</span>
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/signin">
                      <span className="nav-text">Zaloguj</span>
                    </Link>
                  )}
                  {userLoggedIn && userLoggedIn.isAdmin && (
                    <NavDropdown
                      className="dropdown-style"
                      title={<span className="nav-text">Admin</span>}
                      id="admin-nav-dropdown"
                    >
                      <LinkContainer to="/admin/products">
                        <NavDropdown.Item className="dropdown-hov">
                          <span className="nav-text">Produkty</span>
                        </NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/orders">
                        <NavDropdown.Item className="dropdown-hov">
                          <span className="nav-text">Zamówienia</span>
                        </NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/users">
                        <NavDropdown.Item className="dropdown-hov">
                          <span className="nav-text">Użytkownicy</span>
                        </NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
        <div className={sidebarOpen ? 'active-nav side-navbar' : 'side-navbar'}>
          <Nav className="flex-column text-white w-100 p-2">
            <Nav.Item style={{ marginTop: '15px' }}>
              <strong>
                <span className="nav-text">Kategorie</span>
              </strong>
            </Nav.Item>
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer
                  to={`/search?category=${category}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Nav.Link>{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
          </Nav>
        </div>
        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/" element={<MainScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/shipping" element={<AddressScreen />}></Route>
              <Route path="/product/:slug" element={<ItemScreen />} />
              <Route path="/placeorder" element={<MakeOrderScreen />} />
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <AdminOrderListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/orderhistory"
                element={
                  <ProtectedRoute>
                    <UserOrderListScreen />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUserListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <AdminProductListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderScreen />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/admin/user/:id"
                element={
                  <AdminRoute>
                    <AdminUserEditScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/product/:id"
                element={
                  <AdminRoute>
                    <AdminProductEditScreen />
                  </AdminRoute>
                }
              ></Route>
            </Routes>
          </Container>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
