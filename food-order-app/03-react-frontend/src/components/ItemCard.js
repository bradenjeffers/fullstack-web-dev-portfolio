import React from "react";
import { Card, Image } from "react-bootstrap";

// Each kind of item gets its own image shape.
const IMAGE_STYLES = {
  cuisine: { style: { borderRadius: "10px 25px" } },
  category: { roundedCircle: true },
  restaurant: { style: { borderRadius: "5px 25px" } },
};

const ItemCard = ({ itemName, item }) => (
  <Card as="div" border="white" className="p-3 my-3 rounded">
    <Image
      src={item.image}
      alt={item.name}
      width={150}
      height={150}
      loading="lazy"
      className="mx-auto d-block"
      {...IMAGE_STYLES[itemName]}
    />
    <Card.Text as="p" className="mx-auto d-block mt-2">
      <strong>{item.name}</strong>
    </Card.Text>
  </Card>
);

export default ItemCard;
