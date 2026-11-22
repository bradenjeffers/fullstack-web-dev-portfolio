import React from "react";
import { Card, Image } from "react-bootstrap";

// Image size/shape per kind of item, kept from the original design.
const IMAGE_STYLES = {
  cuisine: { size: 100, style: { borderRadius: "10px 25px" } },
  category: { size: 100, roundedCircle: true },
  restaurant: { size: 150, style: { borderRadius: "5px 25px" } },
};

const ItemCard = ({ itemName, item }) => {
  const { size, style, roundedCircle } = IMAGE_STYLES[itemName] || IMAGE_STYLES.restaurant;

  return (
    <Card as="div" border="white" className="p-3 my-3 rounded">
      {item.image && (
        <Image
          src={item.image}
          alt={item.name}
          width={size}
          height={size}
          roundedCircle={roundedCircle}
          style={{ objectFit: "cover", ...style }}
          className="mx-auto d-block"
        />
      )}
      <Card.Text as="p" className="mx-auto d-block text-center mt-2 mb-0">
        <strong>{item.name}</strong>
      </Card.Text>
    </Card>
  );
};

export default ItemCard;
