import React from 'react';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import { SocialIcon } from 'react-social-icons';

const Footer = () => {
  return (
    <Container fluid style={{ backgroundColor: '#323638' }}>
      <Container style={{ marginTop: '30px' }}>
        <Row>
          <Col className="flex-fill" md="3">
            <h5 className="title">Informacje</h5>
            <ul>
              <li className="styled-links">
                <a className="styled-links" href="#!">
                  Kontakt
                </a>
              </li>
              <li className="styled-links">
                <a className="styled-links" href="#!">
                  O nas
                </a>
              </li>
              <li className="styled-links">
                <a className="styled-links" href="#!">
                  Polityka cookies
                </a>
              </li>
              <li className="styled-links">
                <a className="styled-links" href="#!">
                  Regulamin serwisu
                </a>
              </li>
            </ul>
          </Col>
          <Col className="flex-fill" md="3">
            <h5 className="title">Pomoc</h5>
            <ul>
              <li className="styled-links">
                <a className="styled-links" href="#!">
                  Koszty wysyłki
                </a>
              </li>
              <li className="styled-links">
                <a className="styled-links" href="#!">
                  Najczęstsze pytania
                </a>
              </li>
              <li className="styled-links">
                <a className="styled-links" href="#!">
                  Pomoc techniczna
                </a>
              </li>
              <li className="styled-links">
                <a className="styled-links" href="#!">
                  Reklamacje i zwroty
                </a>
              </li>
            </ul>
          </Col>
          <Col className="flex-fill" md="3">
            <h5 className="title">Social Media</h5>
            <ul>
              <li className="styled-links">
                <SocialIcon
                  className="icon-social"
                  url="https://twitter.com/"
                />{' '}
                <a className="styled-links" href="#!">
                  Twitter
                </a>
              </li>
              <li className="styled-links">
                <SocialIcon
                  className="icon-social"
                  url="https://facebook.com/"
                />{' '}
                <a className="styled-links" href="#!">
                  Facebook
                </a>
              </li>
              <li className="styled-links">
                <SocialIcon
                  className="icon-social"
                  url="https://instagram.com/"
                />{' '}
                <a className="styled-links" href="#!">
                  Instagram
                </a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
      <div className="footer-copyright text-center py-3">
        <Container fluid>
          {new Date().getFullYear()} &copy; Gameshop.com
        </Container>
      </div>
    </Container>
  );
};

export default Footer;
