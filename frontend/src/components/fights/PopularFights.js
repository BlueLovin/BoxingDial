import axios from "axios";
import { Container } from "reactstrap";
import { useEffect, useState } from "react";
import SmallFight from "./SmallFight";

export default function PopularFights() {
  const [fightList, setFightList] = useState([]);

  useEffect(() => {
    refreshPostList();
  }, []);

  const refreshPostList = () => {
    axios
      .get("/api/fights/popular")
      .then((res) => setFightList(res.data))
      .catch((err) => console.log(err));
  };
  const renderFights = () => {
    return fightList
      .slice(0, 3)
      .map((fightData) => (
        <div className="border rounded p-3" key={fightData.id}>
          <SmallFight fightData={fightData} />
        </div>
      ));
  };
  return (
    <>
    <Container>
          <div className="card p-3">
            <h4 className="text-center">Popular Fights</h4>
            {renderFights()}
          </div>
      </Container>
    </>
  );
}
