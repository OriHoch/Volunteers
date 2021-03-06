import React, { Component } from 'react';
import axios from 'axios';
import {Button, Image, ListGroup, ListGroupItem, Modal, FormControl} from 'react-bootstrap'
import update from 'immutability-helper';
import * as Permissions from "../../model/permissionsUtils"
import EditDepartment from './EditDepartment';
require('./AdminView.css')

const DEFAULT_LOGO = 'https://yt3.ggpht.com/-t7buXM4UqEc/AAAAAAAAAAI/AAAAAAAAAAA/n5U37nYuExw/s900-c-k-no-mo-rj-c0xffffff/photo.jpg';

export default class AdminView extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      departments: [],
      showEditDepartmentModal: false,
      departmentToEdit: null,

      admins: [],
      showAddAdminModal: false,
      newAdminEmailInput: null
    };
  }

  refreshData = _ => {
    axios.get("/api/v1/departments")
    .then(res => {
      const departments = res.data;
      this.state.departments = departments;
      this.setState(this.state);
    })
    axios.get("/api/v1/permissions/admins")
    .then(res => {
      const admins = res.data;
      this.state.admins = admins;
      this.setState(this.state);
    })
  }

  addDepartment = _ => {
    this.state.departmentToEdit = null;
    this.state.showEditDepartmentModal = true;
    this.setState(this.state);
  }

  editDepartment = departmentId => _ => {
    this.state.departmentToEdit = this.state.departments.find(department => department._id == departmentId);
    this.state.showEditDepartmentModal = true;
    this.setState(this.state);
  }

  hideEditDepartmentModal = _ => {
    this.state.showEditDepartmentModal = false;
    this.setState(this.state);
    this.refreshData();
  }

  showAddAdmin =_ => {
    this.state.showAddAdminModal = true;
    this.setState(this.state);
  }

  addAdmin = _ => {
    axios.post("/api/v1/permissions/admins", {userId: this.state.newAdminEmailInput.value})
    .then(res => {
      this.state.newAdminEmailInput.value = '';
      this.state.showAddAdminModal = false;
      this.setState(this.state);
      this.refreshData();
    })
  }

  hideAddAdmin = _ => {
    this.state.showAddAdminModal = false;
    this.setState(this.state);
  }

  componentDidMount() {
    this.refreshData();
  };

  render() {
    return (
      <div className="admin-view">
        <EditDepartment show={this.state.showEditDepartmentModal}
                        onHide={this.hideEditDepartmentModal}
                        department={this.state.departmentToEdit}/>
        <div className="card container">
          <h1 className="admin-departments">Departments</h1>
          {Permissions.isAdmin() &&
            <Button bsStyle="primary" className="admin-add-button" onClick={this.addDepartment}>Add Department</Button>}
          <ListGroup className="admin-department-list">
          {this.state.departments.map(department => {
            const basicInfo = department.basicInfo;
            const departmentLogo = basicInfo.imageUrl ? basicInfo.imageUrl : DEFAULT_LOGO;
            return (
            <ListGroupItem key={department._id} style={{minHeight:80}}>
              <Image src={departmentLogo} className="admin-department-logo"></Image>
              <div>
                <h4 className="admin-title">{basicInfo.nameEn} - {basicInfo.nameHe}</h4>
                {(Permissions.isAdmin() ||  Permissions.isManagerOfDepartment(department._id))&&
                  <Button bsStyle="link" className="admin-edit-button"
                            onClick={this.editDepartment(department._id)}>Edit</Button>}
              </div>
            </ListGroupItem>
          )})}
          </ListGroup>
        </div>

        {Permissions.isAdmin() &&
        <div className="card container">
          <h1 className="admin-departments">Admins</h1>
          {Permissions.isAdmin() &&
            <Button bsStyle="primary" className="admin-add-button" onClick={this.showAddAdmin}>Add Admin</Button>}
          <ListGroup className="admin-department-list">
          {this.state.admins.map(admin => {
            const adminTitle = `${admin.firstName} ${admin.lastName}`;
            const adminEmail = admin.userId;
            return (
            <ListGroupItem key={admin._id} header={adminTitle}>{adminEmail}</ListGroupItem>
          )})}
          </ListGroup>
        </div>
        }

        <Modal show={this.state.showAddAdminModal}>
          <Modal.Header><Modal.Title>Add Admin</Modal.Title></Modal.Header>
          <Modal.Body>
            <FormControl inputRef={input => this.state.newAdminEmailInput = input} type="text" placeholder="Enter email"/>  
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.hideAddAdmin}>Close</Button>
            <Button bsStyle="primary" onClick={this.addAdmin}>Add</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )}
}
