import { Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
const SmallFight = (props) => {
  let fightData = props.fightData;
  return (
    <>
    <Link to={`/fight/${fightData.id}`}>
      <h4 className="text-center">{fightData.title}</h4>
    </Link>
      <hr />
      <Row>
        <Col className="text-center">
          <img alt="fight" src={fightData.image_URL} className="small-fight-img " />
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

export default SmallFight;
