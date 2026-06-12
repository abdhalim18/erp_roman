const { revalidatePath } = require('next/cache');

// Next.js cache revalidation from external script is not possible directly.
// But I can create an API endpoint and ping it.
