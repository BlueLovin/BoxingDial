import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { UserContext } from '../../UserContext';
import { Col, Container, Row } from 'reactstrap';


export default function FightPage() {
  const params = useParams();
  const fightID = params.fightID;

  const { tokenVal, userVal } = useContext(UserContext);
  const [user] = userVal;
  const [token] = tokenVal;
  const [fightData, setFightData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFightData();
  }, []);

  const fetchFightData = async () => {
    setLoading(true);
    let data = {};
    //fetch fight data
    await axios.get(`/api/fights/${fightID}/`)
      .then((res) => { data = res.data });
    console.log(data)
    setFightData(data); // set local fight object
    setLoading(false);
  };

  const renderPosts = () => {
    return fightData.posts.map((post) => (
      <>
      <Container>
        <div className="list-group-item">
          <p className="font-weight-light list-group-item bg-light">{post.content}</p>
          <p className="text-muted"> by <Link to={`/user/${post.owner}`}>{post.username}</Link></p>
        </div>
      </Container>
      </>
    ));
  };

  return (
    <>
      <br />
      {loading ? "loading" :
        <>
          <div className="container w-75 bg-light bg-gradient">
            <h1 className="text-center display-4">{fightData.title}</h1>
            <hr />
            <Row>
              <Col className="col-xs-1 text-center">
                <img src={fightData.image_URL} className="fight-img " />
              </Col>
              <hr />
              <Col>
                <p>
                  {fightData.description}
                </p>
                <p>
                  <b>Date:</b> {fightData.date}
                  <br />
                  <b>Winner:</b> {fightData.result}
                </p>
              </Col>
            </Row>
            <br />
            {renderPosts()}
          </div>
        </>
      }
    </>
  );
}