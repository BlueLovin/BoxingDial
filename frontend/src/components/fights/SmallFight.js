import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import ShowMoreText from 'react-show-more-text';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

function SmallFight(props) {
	let fightData = props.fightData;
	const history = useHistory();

	const goToFight = () => {
		history.push(`/fight/${fightData.id}`);
	};

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
					<p>
						<b>Date:</b> {fightData.date}
						<br />
						<b>Winner:</b> {fightData.result}
					</p>
				</Col>
			</Row>
			<Row className="p-3 preserve-line-breaks">
				<ShowMoreText onClick={goToFight}>
					<p>{fightData.description}</p>
				</ShowMoreText>
				<br />
			</Row>
		</>
	);
}

export default SmallFight;
