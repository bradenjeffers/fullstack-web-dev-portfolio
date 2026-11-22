import React from "react";
import { Card, ListGroup } from "react-bootstrap";
import { useSelector } from "react-redux";

// Read-only view of the signed-in user's details. The original page had
// editable password fields and an "Update" button that did nothing; none of
// the backends here expose a profile-update endpoint, so the page no longer
// pretends to collect passwords.
const UserProfilePage = () => {
  const userInfo = useSelector((state) => state.login.userInfo) || {};

  const rows = [
    ["Username", userInfo.username],
    ["Full name", userInfo.fullname],
    ["Email", userInfo.email],
    ["Role", userInfo.isAdmin ? "Administrator" : "Customer"],
  ];

  return (
    <Card style={{ maxWidth: 520 }} className="mx-auto">
      <Card.Header as="h2" className="h4">
        My profile
      </Card.Header>
      <ListGroup variant="flush">
        {rows.map(([label, value]) => (
          <ListGroup.Item key={label} className="d-flex justify-content-between">
            <span className="text-muted">{label}</span>
            <span>{value || "-"}</span>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default UserProfilePage;
