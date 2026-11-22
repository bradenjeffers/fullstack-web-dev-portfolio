import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";

// Each card lists the actions the admin area is meant to offer. The CRUD
// screens behind them are outside this assessment, so the buttons are disabled.
const SECTIONS = [
  { title: "Cuisines", actions: ["View Cuisines", "Add Cuisine"] },
  { title: "Categories", actions: ["View Categories", "Add Category"] },
  { title: "Food Items", actions: ["View Food Items", "Add Food Item"] },
  { title: "Restaurants", actions: ["View Restaurants", "Add Restaurant"] },
  { title: "Restaurant Menu", actions: ["View Menu", "Add Menu Item"] },
  { title: "Orders", actions: ["View Orders"] },
  { title: "Users", actions: ["View Users"] },
];

const AdminDashboard = () => (
  <>
    <h2 className="text-center p-4">Admin Dashboard</h2>
    <Row>
      {SECTIONS.map(({ title, actions }) => (
        <Col key={title} md={4} className="mb-3">
          <Card border="secondary">
            <Card.Body>
              <Card.Title as="h3" className="h4">
                {title}
              </Card.Title>
              {actions.map((action) => (
                <Button
                  key={action}
                  variant="outline-info"
                  size="sm"
                  className="me-3"
                  disabled
                >
                  {action}
                </Button>
              ))}
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </>
);

export default AdminDashboard;
