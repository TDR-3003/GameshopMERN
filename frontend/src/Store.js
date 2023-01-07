import { createContext, useReducer } from 'react';

export const Store = createContext();

const initialState = {
  userLoggedIn: localStorage.getItem('userLoggedIn')
    ? JSON.parse(localStorage.getItem('userLoggedIn'))
    : null,
  fullBox: false,
  cart: {
    address: localStorage.getItem('address')
      ? JSON.parse(localStorage.getItem('address'))
      : [],
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
  },
};
function reducer(state, action) {
  switch (action.type) {
    case 'SET_FULLBOX_ON':
      return { ...state, fullBox: true };
    case 'SET_FULLBOX_OFF':
      return { ...state, fullBox: false };
    case 'CART_REMOVE_GAME': {
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case 'CART_ADD_GAME':
      const newGame = action.payload;
      const existingGame = state.cart.cartItems.find(
        (item) => item._id === newGame._id
      );
      const cartItems = existingGame
        ? state.cart.cartItems.map((item) =>
            item._id === existingGame._id ? newGame : item
          )
        : [...state.cart.cartItems, newGame];
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    case 'CART_EMPTY':
      return { ...state, cart: { ...state.cart, cartItems: [] } };
    case 'USER_SIGNIN':
      return { ...state, userLoggedIn: action.payload };
    case 'USER_SIGNOUT':
      return {
        ...state,
        userLoggedIn: null,
        cart: {
          cartItems: [],
          address: {},
        },
      };
    case 'SAVE_ADDRESS':
      return {
        ...state,
        cart: {
          ...state.cart,
          address: action.payload,
        },
      };
    default:
      return state;
  }
}

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children} </Store.Provider>;
}
