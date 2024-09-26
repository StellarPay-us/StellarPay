# Gateway

This is a payment gateway for processing and validating ISO 20022 XML messages, storing relevant data in a SQLite database, and queuing messages for further processing.

## Features

- Parses and validates ISO 20022 XML messages (e.g., `pain.001.001.12.xml`).
- Stores messages and related transactions in a SQLite in-memory database.
- Queues messages for further processing.
- Provides RESTful API for receiving and processing XML messages.
- Unit tests with Jest.

## Starting the Server

To start the server:

```bash
pnpm run dev
```

The server will start at `http://localhost:3010`.

## Environment Setup

This project does not require any special environment variables. The database is an in-memory SQLite database, which resets every time the server is restarted.

## API Endpoints

`POST /messages`

- Description: Receives an XML message, validates it, and stores it in the database if valid.
- Content-Type: application/xml
- Request Body: ISO 20022 XML message (e.g., pain.001.001.12.xml)
- Response:
  - 201: Message received and processed.
  - 400: Invalid XML message with validation errors.
  - 500: Internal server error during processing.

Example Request:

```bash
curl -X POST http://localhost:3010/messages \
  -H "Content-Type: application/xml" \
  --data-binary @../../../resources/files/messages/pain.001.001.12.xm
```

## Database Schema

The project uses a simple SQLite schema with three tables:

- messages: Stores message metadata (e.g., `msg_id?`, `cre_dt_tm`, `ctrl_sum`).
- transactions: Stores transactions related to messages.
- queue: Tracks message queue status (`ready_to_forward` flag).

## Running Tests

The project includes unit tests using Jest. To run the tests:

```bash
pnpm jest test
```

This will execute all tests in the tests directory, including tests for message processing and database interactions.
