import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  Spinner,
  Flex,
  Divider,
  Text,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useProject } from "../../contexts/ProjectContext";
import { FiArrowLeft, FiSave } from "react-icons/fi";

const ProjectForm = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isEditMode = Boolean(projectId);

  const {
    currentProject,
    loading,
    error,
    createProject,
    updateProject,
    fetchProject,
    fetchProjects,
    clearCurrentProject,
  } = useProject();

  const [initialValues, setInitialValues] = useState({
    name: "",
    description: "",
    location: "",
    projectType: "residential",
    status: "planning",
    startDate: "",
    endDate: "",
    budget: 0,
    currency: "USD",
    totalApartments: 0,
    studioApartments: 0,
    oneBhkApartments: 0,
    twoBhkApartments: 0,
    penthouses: 0,
    retails: 0,
    buildupArea: 0,
    areaUnit: "sqft",
  });

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Project name is required")
      .min(2, "Name must be at least 2 characters")
      .max(255, "Name cannot exceed 255 characters"),
    description: Yup.string().max(
      1000,
      "Description cannot exceed 1000 characters"
    ),
    location: Yup.string().max(255, "Location cannot exceed 255 characters"),
    projectType: Yup.string().oneOf([
      "residential",
      "commercial",
      "industrial",
    ]),
    status: Yup.string().oneOf([
      "planning",
      "active",
      "on_hold",
      "completed",
      "cancelled",
    ]),
    startDate: Yup.string()
      .nullable()
      .transform((value) => {
        return value === "" ? null : value;
      }),
    endDate: Yup.string()
      .nullable()
      .transform((value) => {
        return value === "" ? null : value;
      })
      .test(
        "end-date",
        "End date must be after start date",
        function (endDate) {
          const { startDate } = this.parent;
          if (!startDate || !endDate) return true;
          return new Date(endDate) > new Date(startDate);
        }
      ),
    budget: Yup.number().min(0, "Budget cannot be negative"),
    totalApartments: Yup.number().integer().min(0),
    studioApartments: Yup.number().integer().min(0),
    oneBhkApartments: Yup.number().integer().min(0),
    twoBhkApartments: Yup.number().integer().min(0),
    penthouses: Yup.number().integer().min(0),
    retails: Yup.number().integer().min(0),
    buildupArea: Yup.number().min(0, "Buildup area cannot be negative"),
  });

  useEffect(() => {
    if (isEditMode) {
      fetchProject(projectId);
    } else {
      clearCurrentProject();
    }

    return () => clearCurrentProject();
  }, [projectId, isEditMode]);

  useEffect(() => {
    if (currentProject && isEditMode) {
      setInitialValues({
        name: currentProject.name || "",
        description: currentProject.description || "",
        location: currentProject.location || "",
        projectType: currentProject.projectType || "residential",
        status: currentProject.status || "planning",
        startDate: currentProject.startDate
          ? new Date(currentProject.startDate).toISOString().split("T")[0]
          : "",
        endDate: currentProject.endDate
          ? new Date(currentProject.endDate).toISOString().split("T")[0]
          : "",
        budget: currentProject.budget || 0,
        currency: currentProject.currency || "USD",
        totalApartments: currentProject.totalApartments || 0,
        studioApartments: currentProject.studioApartments || 0,
        oneBhkApartments: currentProject.oneBhkApartments || 0,
        twoBhkApartments: currentProject.twoBhkApartments || 0,
        penthouses: currentProject.penthouses || 0,
        retails: currentProject.retails || 0,
        buildupArea: currentProject.buildupArea || 0,
        areaUnit: currentProject.areaUnit || "sqft",
      });
    }
  }, [currentProject, isEditMode]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const submitData = {
        ...values,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
      };

      let result;
      if (isEditMode) {
        result = await updateProject(projectId, submitData);
      } else {
        result = await createProject(submitData);
      }

      // Show success message
      toast.success(
        isEditMode
          ? "Project updated successfully"
          : "Project created successfully"
      );

      // Navigate to the projects list instead of individual project
      navigate("/dashboard/company/projects");

      // Refresh the projects list
      fetchProjects();
    } catch (error) {
      toast.error(error.message || "Failed to save project");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Container maxW="4xl" py={8}>
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" />
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex align="center" gap={4}>
          <Heading size="lg">
            {isEditMode ? "Edit Project" : "Create New Project"}
          </Heading>
        </Flex>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values, setFieldValue }) => (
            <Form>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Basic Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                      <GridItem colSpan={2}>
                        <FormControl isInvalid={errors.name && touched.name}>
                          <FormLabel>Project Name *</FormLabel>
                          <Field
                            as={Input}
                            name="name"
                            placeholder="Enter project name"
                          />
                          {errors.name && touched.name && (
                            <Text color="red.500" fontSize="sm">
                              {errors.name}
                            </Text>
                          )}
                        </FormControl>
                      </GridItem>

                      <GridItem colSpan={2}>
                        <FormControl
                          isInvalid={errors.description && touched.description}
                        >
                          <FormLabel>Description</FormLabel>
                          <Field
                            as={Textarea}
                            name="description"
                            placeholder="Enter project description"
                            rows={4}
                          />
                          {errors.description && touched.description && (
                            <Text color="red.500" fontSize="sm">
                              {errors.description}
                            </Text>
                          )}
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl
                          isInvalid={errors.location && touched.location}
                        >
                          <FormLabel>Location</FormLabel>
                          <Field
                            as={Input}
                            name="location"
                            placeholder="Enter project location"
                          />
                          {errors.location && touched.location && (
                            <Text color="red.500" fontSize="sm">
                              {errors.location}
                            </Text>
                          )}
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Project Type</FormLabel>
                          <Field as={Select} name="projectType">
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                          </Field>
                        </FormControl>
                      </GridItem>

                      {isEditMode && (
                        <GridItem>
                          <FormControl>
                            <FormLabel>Status</FormLabel>
                            <Field as={Select} name="status">
                              <option value="planning">Planning</option>
                              <option value="active">Active</option>
                              <option value="on_hold">On Hold</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </Field>
                          </FormControl>
                        </GridItem>
                      )}
                    </Grid>
                  </CardBody>
                </Card>

                {/* Timeline & Budget */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Timeline & Budget</Heading>
                  </CardHeader>
                  <CardBody>
                    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                      <GridItem>
                        <FormControl
                          isInvalid={errors.startDate && touched.startDate}
                        >
                          <FormLabel>Start Date</FormLabel>
                          <Field name="startDate">
                            {({ field }) => (
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFieldValue("startDate", value);
                                }}
                              />
                            )}
                          </Field>
                          {errors.startDate && touched.startDate && (
                            <Text color="red.500" fontSize="sm">
                              {errors.startDate}
                            </Text>
                          )}
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl
                          isInvalid={errors.endDate && touched.endDate}
                        >
                          <FormLabel>End Date</FormLabel>
                          <Field name="endDate">
                            {({ field }) => (
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFieldValue("endDate", value);
                                }}
                              />
                            )}
                          </Field>
                          {errors.endDate && touched.endDate && (
                            <Text color="red.500" fontSize="sm">
                              {errors.endDate}
                            </Text>
                          )}
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl
                          isInvalid={errors.budget && touched.budget}
                        >
                          <FormLabel>Budget</FormLabel>
                          <Field name="budget">
                            {({ field }) => (
                              <NumberInput
                                {...field}
                                onChange={(value) =>
                                  setFieldValue(
                                    "budget",
                                    parseFloat(value) || 0
                                  )
                                }
                                min={0}
                              >
                                <NumberInputField />
                              </NumberInput>
                            )}
                          </Field>
                          {errors.budget && touched.budget && (
                            <Text color="red.500" fontSize="sm">
                              {errors.budget}
                            </Text>
                          )}
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Currency</FormLabel>
                          <Field as={Select} name="currency">
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="AED">AED - UAE Dirham</option>
                          </Field>
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </CardBody>
                </Card>

                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Project Details</Heading>
                  </CardHeader>
                  <CardBody>
                    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Total Apartments</FormLabel>
                          <Field name="totalApartments">
                            {({ field }) => (
                              <NumberInput
                                {...field}
                                onChange={(value) =>
                                  setFieldValue(
                                    "totalApartments",
                                    parseInt(value) || 0
                                  )
                                }
                                min={0}
                              >
                                <NumberInputField />
                              </NumberInput>
                            )}
                          </Field>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Studio Apartments</FormLabel>
                          <Field name="studioApartments">
                            {({ field }) => (
                              <NumberInput
                                {...field}
                                onChange={(value) =>
                                  setFieldValue(
                                    "studioApartments",
                                    parseInt(value) || 0
                                  )
                                }
                                min={0}
                              >
                                <NumberInputField />
                              </NumberInput>
                            )}
                          </Field>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>1 BHK Apartments</FormLabel>
                          <Field name="oneBhkApartments">
                            {({ field }) => (
                              <NumberInput
                                {...field}
                                onChange={(value) =>
                                  setFieldValue(
                                    "oneBhkApartments",
                                    parseInt(value) || 0
                                  )
                                }
                                min={0}
                              >
                                <NumberInputField />
                              </NumberInput>
                            )}
                          </Field>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>2 BHK Apartments</FormLabel>
                          <Field name="twoBhkApartments">
                            {({ field }) => (
                              <NumberInput
                                {...field}
                                onChange={(value) =>
                                  setFieldValue(
                                    "twoBhkApartments",
                                    parseInt(value) || 0
                                  )
                                }
                                min={0}
                              >
                                <NumberInputField />
                              </NumberInput>
                            )}
                          </Field>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Penthouses</FormLabel>
                          <Field name="penthouses">
                            {({ field }) => (
                              <NumberInput
                                {...field}
                                onChange={(value) =>
                                  setFieldValue(
                                    "penthouses",
                                    parseInt(value) || 0
                                  )
                                }
                                min={0}
                              >
                                <NumberInputField />
                              </NumberInput>
                            )}
                          </Field>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Retail Units</FormLabel>
                          <Field name="retails">
                            {({ field }) => (
                              <NumberInput
                                {...field}
                                onChange={(value) =>
                                  setFieldValue("retails", parseInt(value) || 0)
                                }
                                min={0}
                              >
                                <NumberInputField />
                              </NumberInput>
                            )}
                          </Field>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl
                          isInvalid={errors.buildupArea && touched.buildupArea}
                        >
                          <FormLabel>Buildup Area</FormLabel>
                          <Field name="buildupArea">
                            {({ field }) => (
                              <NumberInput
                                {...field}
                                onChange={(value) =>
                                  setFieldValue(
                                    "buildupArea",
                                    parseFloat(value) || 0
                                  )
                                }
                                min={0}
                              >
                                <NumberInputField />
                              </NumberInput>
                            )}
                          </Field>
                          {errors.buildupArea && touched.buildupArea && (
                            <Text color="red.500" fontSize="sm">
                              {errors.buildupArea}
                            </Text>
                          )}
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Area Unit</FormLabel>
                          <Field as={Select} name="areaUnit">
                            <option value="sqft">Square Feet</option>
                            <option value="sqm">Square Meters</option>
                          </Field>
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </CardBody>
                </Card>

                {/* Action Buttons */}
                <Flex justify="space-between">
                  {/* navigate back */}
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard/company/projects")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    leftIcon={<FiSave />}
                    colorScheme="blue"
                    isLoading={isSubmitting}
                    loadingText={isEditMode ? "Updating..." : "Creating..."}
                  >
                    {isEditMode ? "Update Project" : "Create Project"}
                  </Button>
                </Flex>
              </VStack>
            </Form>
          )}
        </Formik>
      </VStack>
    </Container>
  );
};

export default ProjectForm;
