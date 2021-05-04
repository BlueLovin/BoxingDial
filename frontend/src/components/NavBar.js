import { useState } from "react";
import { Navbar, Nav, NavItem, NavLink, NavbarBrand, NavbarToggler, Collapse, UncontrolledDropdown, DropdownMenu, DropdownItem, NavbarText, DropdownToggle } from "reactstrap";
import ShowUser from "./ShowUser";

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  return (
    <>
      <Navbar color="light" light expand="md">
        <NavbarBrand href="/">BoxOffice</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <NavLink href="/">Home</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="">Popular Posts</NavLink>
            </NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Fights
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  Popular
                </DropdownItem>
                <DropdownItem>
                  New
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem>
                  Reset
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
          <NavbarText><ShowUser /></NavbarText>
        </Collapse>
      </Navbar>
    </>
  )
}