import { Row, Col } from "reactstrap";

const Fight = (props) => {
  let fightData = props.fightData;
  return (
    <>
      <h1 className="text-center display-4">{fightData.title}</h1>
      <hr />
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
    </>
  );
};

export default Fight;
