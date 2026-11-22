import React from "react";
import { Row, Col } from "react-bootstrap";
import ItemCard from "../../components/ItemCard";
import categories from "../../categories";
import cuisines from "../../cuisines";
import restaurants from "../../restaurants";

const Section = ({ id, title, itemName, items }) => (
  <section className="container-fluid my-5" aria-labelledby={id}>
    <h3 id={id} className="mb-4">
      {title}
    </h3>
    <Row>
      {items.map((item) => (
        <Col key={item.id} md={3}>
          <ItemCard itemName={itemName} item={item} />
        </Col>
      ))}
    </Row>
  </section>
);

const HomePage = () => (
  <>
    <Section
      id="cuisines-heading"
      title="Try New Cuisines"
      itemName="cuisine"
      items={cuisines}
    />
    <Section
      id="categories-heading"
      title="Explore Categories"
      itemName="category"
      items={categories}
    />
    <Section
      id="restaurants-heading"
      title="Order from Top Restaurants"
      itemName="restaurant"
      items={restaurants}
    />
  </>
);

export default HomePage;
