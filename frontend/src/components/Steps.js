import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

export default function CheckoutSteps(props) {
  return (
    <Row className="checkout-steps ">
      <Col className={props.step1 ? 'active' : ''}>
        <div className="stepdiv">
          <div style={{ marginRight: '20px' }} className="titlestep">
            Logowanie
          </div>
          <div className={'divider ' + (props.step1 ? 'active' : '')}></div>
        </div>
      </Col>
      <Col className={props.step2 ? 'active' : ''}>
        <div className="stepdiv">
          <div style={{ marginRight: '20px' }} className="titlestep">
            Adres
          </div>
          <div className={'divider ' + (props.step3 ? 'active' : '')}></div>
        </div>
      </Col>
      <Col
        md={1}
        style={{ marginRight: '20px' }}
        className={props.step3 ? 'active' : ''}
      >
        <div className="stepdiv">
          <div style={{ marginRight: '20px' }} className="titlestep">
            Zamówienie
          </div>
        </div>
      </Col>
    </Row>
  );
}
