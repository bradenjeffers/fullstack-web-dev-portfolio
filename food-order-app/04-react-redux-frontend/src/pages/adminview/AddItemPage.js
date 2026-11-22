import React, { useState } from "react";
import { Container, Form, Button, Image } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Link, Navigate, useParams } from "react-router-dom";
import AlertMessage from "../../components/AlertMessage";
import { addLocalItem } from "../../actions/localCatalogActions";
import { getEntity } from "./entities";

const EMPTY_FORM = { name: "", detail: "", image: "" };

const AddItemPage = () => {
  const { entity: entityKey } = useParams();
  const entity = getEntity(entityKey);
  const dispatch = useDispatch();
  const [form, setForm] = useState(EMPTY_FORM);
  const [success, setSuccess] = useState("");

  if (!entity) return <Navigate to="/admin" replace />;

  const handleChange = (field) => (event) => {
    setSuccess("");
    setForm({ ...form, [field]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(
      addLocalItem(entity.key, {
        name: form.name.trim(),
        [entity.detailField]: form.detail.trim(),
        image: form.image.trim(),
      })
    );
    setForm(EMPTY_FORM);
    setSuccess(`${entity.singular} added`);
  };

  return (
    <Container>
      <Link to="/admin" className="btn btn-link ps-0">
        &larr; Dashboard
      </Link>
      <h2 className="h3 mb-3">Add {entity.singular.toLowerCase()}</h2>
      {success && <AlertMessage variant="success" message={success} />}
      {form.image && (
        <div className="text-center">
          <Image src={form.image} alt="Preview" width={200} height={200} rounded style={{ objectFit: "cover" }} />
        </div>
      )}
      <Link to={`/admin/${entity.key}`} className="btn btn-outline-info my-3">
        View {entity.plural.toLowerCase()}
      </Link>
      <Form className="mb-0 rounded p-4 bg-light" onSubmit={handleSubmit}>
        <Form.Group controlId="itemName" className="mb-3">
          <Form.Label>{entity.singular} Name</Form.Label>
          <Form.Control
            type="text"
            placeholder={`${entity.singular} Name`}
            value={form.name}
            onChange={handleChange("name")}
            required
          />
        </Form.Group>
        <Form.Group controlId="itemDetail" className="mb-3">
          <Form.Label>
            {entity.singular} {entity.detailLabel}
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder={`${entity.singular} ${entity.detailLabel}`}
            value={form.detail}
            onChange={handleChange("detail")}
          />
        </Form.Group>
        <Form.Group controlId="itemImage" className="mb-3">
          <Form.Label>{entity.singular} Image URL</Form.Label>
          <Form.Control
            type="url"
            placeholder="https://..."
            value={form.image}
            onChange={handleChange("image")}
          />
        </Form.Group>
        <Button type="submit" variant="info" className="mb-1">
          Add {entity.singular.toLowerCase()}
        </Button>
        <Form.Text className="d-block">
          Saved in this browser only; the API used by this client has no create endpoint.
        </Form.Text>
      </Form>
    </Container>
  );
};

export default AddItemPage;
