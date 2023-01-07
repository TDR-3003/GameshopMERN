import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import { useNavigate } from 'react-router-dom';

export default function SearchBox() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const submitHandler = (e) => {
    e.preventDefault();
    navigate(query ? `/search/?query=${query}` : '/search');
  };

  return (
    <Form className="d-flex w-100" onSubmit={submitHandler}>
      <InputGroup>
        <Button
          className="search-btn"
          style={{
            color: '#d1cdc7',
            backgroundColor: '#323638',
            borderColor: '#323638',
          }}
          variant="primary"
          type="submit"
          id="button-search"
        >
          <i className="fas fa-search"></i>
        </Button>
        <FormControl
          type="text"
          style={{
            backgroundColor: '#181a1b',
            border: 'none',
            color: '#d1cdc7',
          }}
          name="q"
          id="q"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj..."
          aria-label="Szukaj produkty"
          aria-describedby="button-search"
        ></FormControl>
      </InputGroup>
    </Form>
  );
}
