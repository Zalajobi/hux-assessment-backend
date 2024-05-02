import {NextFunction, Request, Response, Router} from 'express';
import {SearchContactsRequestSchema} from "@schemas/contactsSchemas";
import {JsonApiResponse} from "@util/responses";
import {verifyJSONToken} from "@util/index";
import {getSearchContactsData} from "@datastore/contactStore";

const contactsRouter = Router();

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

export default contactsRouter;