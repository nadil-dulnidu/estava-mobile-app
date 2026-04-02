// Controller layer for appointment endpoints.
const catchAsync = require("../utils/catchAsync");
const { successResponse } = require("../utils/apiResponse");
const {
  validateCreateAppointmentInput,
  validateUpdateAppointmentInput
} = require("../validators/appointmentValidator");
const {
  createAppointment,
  listAppointmentsForUser,
  updateAppointment,
  deleteAppointment
} = require("../services/appointmentService");

const create = catchAsync(async (req, res) => {
  validateCreateAppointmentInput(req.body);
  const appointment = await createAppointment(req.body, req.user._id);
  return successResponse(res, appointment, "Appointment created successfully", 201);
});

const listMine = catchAsync(async (req, res) => {
  const appointments = await listAppointmentsForUser(req.user);
  return successResponse(res, appointments, "Appointments fetched successfully", 200);
});

const update = catchAsync(async (req, res) => {
  validateUpdateAppointmentInput(req.body);
  const appointment = await updateAppointment(req.params.id, req.body, req.user);
  return successResponse(res, appointment, "Appointment updated successfully", 200);
});

const remove = catchAsync(async (req, res) => {
  await deleteAppointment(req.params.id, req.user);
  return successResponse(res, null, "Appointment cancelled successfully", 200);
});

module.exports = {
  create,
  listMine,
  update,
  remove
};