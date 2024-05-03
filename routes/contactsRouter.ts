import {NextFunction, Request, Response, Router} from 'express';
import {
  createContactRequestSchema,
  GetContactDetailsRequestSchema,
  SearchContactsRequestSchema,
  UpdateContactRequestSchema
} from "@schemas/contactsSchemas";
import {JsonApiResponse} from "@util/responses";
import {verifyJSONToken} from "@util/index";
import {
  createContact,
  deleteContactById, getAllContactByUserId,
  getContactById,
  getSearchContactsData,
  updateContactById
} from "@datastore/contactStore";
import {bearerTokenSchema} from "@schemas/commonSchemas";

const contactsRouter = Router();

// Contact Search
contactsRouter.post('/search', async (req:Request, res:Response, next:NextFunction) => {
  try {
    const requestBody = SearchContactsRequestSchema.parse({
      ...req.body,
      ...req.headers
    })

    const decryptedData = verifyJSONToken(requestBody?.authorization ?? '');
    requestBody.userId = decryptedData?.id;

    const [contactsData, totalRows] = await getSearchContactsData(requestBody);
    return JsonApiResponse(res, "Success", true, {
      contacts: contactsData,
      totalRows
    }, 200)
  } catch (error) {
    next(error)
  }
});

// Get contact Details
contactsRouter.get('/details/:id', async (req:Request, res:Response, next:NextFunction) => {
  try {
    const requestBody = GetContactDetailsRequestSchema.parse({
      ...req.headers,
      ...req.params
    })

    const contact = await getContactById(requestBody.id);

    return JsonApiResponse(res, "Success", true, contact, 200)
  } catch (error) {
    next(error)
  }
})

// Delete Contact
contactsRouter.delete('/delete/:id', async (req:Request, res:Response, next:NextFunction) => {
  try {
    const requestBody = GetContactDetailsRequestSchema.parse({
      ...req.headers,
      ...req.params
    })

    const contact = await deleteContactById(requestBody.id);

    return JsonApiResponse(res, "Contact Deleted Successfully", true, contact, 200)
  } catch (error) {
    next(error)
  }
});

// Update Contact
contactsRouter.put('/update', async (req:Request, res:Response, next: NextFunction) => {
  try {
    const requestBody = UpdateContactRequestSchema.parse({
      ...req.headers,
      ...req.body
    })
    const { authorization, ...updateBody } = requestBody;

    const updateContact = await updateContactById(updateBody.id, updateBody);

    return JsonApiResponse(res, updateContact.message, updateContact.success, null, 200)
  } catch (error) {
    next(error)
  }
});

// Create Contact
contactsRouter.post('/create', async (req:Request, res:Response, next:NextFunction) => {
  try {
    const requestBody = createContactRequestSchema.parse({
      ...req.headers,
      ...req.body
    })

    const decryptedData = verifyJSONToken(requestBody.authorization);
    requestBody.userId = decryptedData?.id;

    const contact = await createContact(requestBody);

    return JsonApiResponse(res, contact.message, contact.success, null, 200)
  } catch (error) {
    next(error)
  }
})

// Get All contacts of a user
contactsRouter.get('/all', async (req:Request, res:Response, next:NextFunction) => {
  try {
    const requestBody = bearerTokenSchema.parse(req.headers)

    const decryptedData = verifyJSONToken(requestBody.authorization);

    const contacts = await getAllContactByUserId(decryptedData?.id ?? '');

    return JsonApiResponse(res, contacts ? "Success" : "Something went Wrong", !!contacts, contacts, 200)
  } catch (error) {
    next(error)
  }
})


export default contactsRouter;