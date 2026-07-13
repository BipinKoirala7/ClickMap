import { z } from "zod";
import "src/openapi/zod-extends"; 
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);