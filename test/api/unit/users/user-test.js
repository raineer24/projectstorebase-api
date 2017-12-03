const sinon = require('sinon');
const chai = require('chai');
const expect = require('chai').expect;
const chaiAsPromised = require('chai-as-promised');

const rewire = require('rewire');

const User = rewire('../../../../api/users/user');

describe('unit - user - model', () => {
  describe('User.authenticate', () => {

  });
  describe('User.authorize', () => {

  });
  describe('User.saveAccount', () => {

  });
  describe('User.updateAccount', () => {

  });
  describe('User.getByValue', () => {

  });
  describe('User.getByUser', () => {

  });
  describe('User.getById', () => {
    // it ('should resolve successfully', () => {
    //   chai.use(chaiAsPromised);
    //   const expectAP = chai.expect;
    //   const userMock = {
    //     getByID: sinon.stub().resolves({}),
    //   };
    //
    //   const readStub = sinon.stub(userMock, 'getById').resolves();
    //
    //   // console.log(User.getById);
    //   // User.getById = userMock.readAsync;
    //   return User.getById(123)
    //     .then(() => {
    //       // expectAP(readStub.getCall(0).args[0].q).to.equal(1);
    //     });
    // });
  });
  describe ('User.cleanResponse', () => {
    it ('should return an object without password property', () => {
      const currResp = {
        password: '',
      };
      const newResp = User.cleanResponse(currResp, { prop3: '' });
      expect(newResp).to.not.have.property('password');
    });
    it ('should return an object with merged properties', () => {
      const currResp = {
        prop1: '',
        prop2: '',
        password: '',
      };
      const newResp = User.cleanResponse(currResp, { prop3: '' });
      expect(newResp).to.have.property('prop3');
    });
  });
});
