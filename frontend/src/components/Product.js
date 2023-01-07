import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';

function Product(props) {
  const { product } = props;

  return (
    <Card className="product-card">
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </Link>
      <Card.Body>
        <Link className="product-title" to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
      </Card.Body>
    </Card>
  );
}
export default Product;
