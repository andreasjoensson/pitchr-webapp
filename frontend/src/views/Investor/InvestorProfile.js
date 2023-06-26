import React, { useEffect } from "react";
import { Col, Container, Row, Tab } from "react-bootstrap";
import AboutMe from "../../components/InvestmentProfile/AboutMe";
import CapitalAndCompetences from "../../components/InvestmentProfile/CapitalAndCompetences";
import InvestmentDetails from "../../components/InvestmentProfile/InvestmentDetails";
import ProfileNav from "../../components/InvestmentProfile/ProfileNav";
import TopBanner from "../../components/InvestmentProfile/TopBanner";
import { userService } from "../../store/services";
import { useParams } from "react-router-dom";
import { useState } from "react";

const InvestorProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    userService.getById(id).then((res) => {
      console.log(res);
      setProfile(res.data);
    });
  }, []);

  return (
    <>
      <Container fluid>
        <Row>
          <Tab.Container id="left-tabs-example" defaultActiveKey="second">
            <TopBanner />
            <ProfileNav />
            <Col sm={12}>
              <Tab.Content>
                <AboutMe />
                <InvestmentDetails />
                <CapitalAndCompetences capital={profile.available_capital} />
              </Tab.Content>
            </Col>
          </Tab.Container>
        </Row>
      </Container>
    </>
  );
};

export default InvestorProfile;
