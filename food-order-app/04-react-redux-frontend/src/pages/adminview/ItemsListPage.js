import React, { useEffect } from "react";
import { Table, Container, Button, Image } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Link, Navigate, useParams } from "react-router-dom";
import AlertMessage from "../../components/AlertMessage";
import useCatalog from "../../hooks/useCatalog";
import { removeLocalItem } from "../../actions/localCatalogActions";
import { listCategories } from "../../actions/categoryActions";
import { listCuisines } from "../../actions/cuisineActions";
import { listRestaurants } from "../../actions/restaurantActions";
import { itemId } from "../../utils/apiHelpers";
import { getEntity } from "./entities";

const FETCHERS = {
  categories: listCategories,
  cuisines: listCuisines,
  restaurants: listRestaurants,
};

const ItemsListPage = () => {
  const { entity: entityKey } = useParams();
  const entity = getEntity(entityKey);
  const dispatch = useDispatch();
  const { items, error } = useCatalog(entity ? entity.key : "categories");

  useEffect(() => {
    if (entity) dispatch(FETCHERS[entity.key]());
  }, [dispatch, entity]);

  if (!entity) return <Navigate to="/admin" replace />;

  return (
    <Container>
      <Link to="/admin" className="btn btn-link ps-0">
        &larr; Dashboard
      </Link>
      <h2 className="h3 mb-3">{entity.plural}</h2>
      {error && <AlertMessage variant="danger" message={error} />}
      <Link to={`/admin/${entity.key}/new`} className="btn btn-outline-info my-3">
        Add {entity.singular.toLowerCase()}
      </Link>
      {items.length === 0 ? (
        <AlertMessage variant="info" message={`No ${entity.plural.toLowerCase()} yet`} />
      ) : (
        <Table striped hover bordered className="table-sm text-center align-middle">
          <thead>
            <tr>
              <th>Id</th>
              <th>Image</th>
              <th>Name</th>
              <th>{entity.detailLabel}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={itemId(item)}>
                <td>{item.local ? "local" : itemId(item)}</td>
                <td>{item.image && <Image src={item.image} alt={item.name} width={80} height={80} style={{ objectFit: "cover" }} />}</td>
                <td>{item.name}</td>
                <td>{item[entity.detailField]}</td>
                <td>
                  {item.local ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => dispatch(removeLocalItem(entity.key, item.id))}
                    >
                      Delete
                    </Button>
                  ) : (
                    <span className="text-muted">Read-only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ItemsListPage;
