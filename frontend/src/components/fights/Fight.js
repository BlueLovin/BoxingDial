import { Row, Col } from "reactstrap";

const Fight = (props) => {
  let fightData = props.fightData;
  return (
    <Row>
      <Col className="col-xs-1 text-center">
        <img alt="fight" src={fightData.image_URL} className="fight-img " />
      </Col>
      <hr />
      <Col>
        <p>{fightData.description}</p>
        <p>
          <b>Date:</b> {fightData.date}
          <br />
          <b>Winner:</b> {fightData.result}
        </p>
      </Col>
    </Row>
  );
};

export default Fight;
