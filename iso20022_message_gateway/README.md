# ISO2022 Message Gateway (IMG)

The **ISO2022 Message Gateway (IMG)** is a monorepo that provides a robust solution for processing, validating, and converting ISO 20022 payment initiation messages. It consists of several packages designed to handle different aspects of ISO 20022 XML messages, including validation, parsing, conversion, and queuing for further processing.

## Monorepo Structure

The monorepo consists of the following key packages:

1. **ISO20022 Processor**  
   A library that handles the validation and parsing of ISO 20022 payment initiation messages (`pain.001.001.12` schema). It supports:
   - XML validation against XSD schemas.
   - XML parsing and extraction of transaction data.
   - Error reporting for validation failures.
   For more details, refer to the package’s [README](./packages/iso20022-processor/README.md).

2. **Payment Gateway**  
   A payment gateway that processes and validates ISO 20022 XML messages, stores relevant data in an SQLite database, and queues messages for further processing. It includes:
   - RESTful API for receiving and validating XML messages.
   - SQLite in-memory database for message storage.
   - Queuing for downstream processing.
   For more details, refer to the package’s [README](./packages/payment-gateway/README.md).

3. **SEP Converter**  
   A utility that converts ISO 20022 payment messages (`pain.001`) to the SEP-31 format. It supports:
   - Conversion of ISO 20022 messages to SEP-31 objects.
   - Handling of multiple transactions in a single message.
   - Customizable asset issuer (defaulted to "Stellar").
   For more details, refer to the package’s [README](./packages/sep-converter/README.md).

## Features

- **ISO 20022 Message Processing**: End-to-end handling of ISO 20022 messages, including validation, parsing, storage, and conversion.
- **SQLite Integration**: In-memory database support for storing and processing message data.
- **REST API**: Exposes a REST API for receiving ISO 20022 messages.
- **Queueing System**: Messages can be queued for downstream processing.
- **ISO 20022 to SEP-31 Conversion**: Convert ISO 20022 message data to SEP-31 compliant objects.

## Installation

To get started with the project, clone the repository and install dependencies:

```bash
git clone <repository-url>
cd iso20022_message_gateway
pnpm install
```