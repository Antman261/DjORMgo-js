# Contributing to DjORMgo-js!

Thanks for contributing to DjORMgo-js!

## Running Tests

Use `docker-compose up` to fire up a test postgres server on `localhost:5432`

Create and drop tables as required for each test case. Give each test table a unique name prefixed with `test_`, this prevents asynchronous testing collisions.

This is necessary because DjORMgo's tests are all executed asynchronously, so isolation must occur at the table level.

## Submitting Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the TypeScript styleguides.
* Cover code with unit or integration tests as much as possible.
* Document new code based
* End all files with a newline
