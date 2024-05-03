import {NextFunction, Request, Response, Router} from 'express';
import {GetContactDetailsRequestSchema, SearchContactsRequestSchema} from "@schemas/contactsSchemas";
import {JsonApiResponse} from "@util/responses";
import {verifyJSONToken} from "@util/index";
import {deleteContactById, getContactById, getSearchContactsData} from "@datastore/contactStore";

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



export default contactsRouter;