import React from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import ItemCard from "./ItemCard";
import AlertMessage from "./AlertMessage";
import { itemId } from "../utils/apiHelpers";

const CatalogSection = ({ title, itemName, items, loading, error }) => (
  <section className="container-fluid mb-5">
    <h3 className="mb-3">{title}</h3>
    {loading && <Spinner animation="border" role="status" size="sm" />}
    {error && <AlertMessage variant="danger" message={error} />}
    {!loading && !error && items.length === 0 && (
      <AlertMessage variant="info" message="Nothing to show yet" />
    )}
    <Row>
      {items.map((item) => (
        <Col key={itemId(item)} md={3}>
          <ItemCard itemName={itemName} item={item} />
        </Col>
      ))}
    </Row>
  </section>
);

export default CatalogSection;
