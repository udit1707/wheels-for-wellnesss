# Service- RabbitMQ Queue Worker

* Process the patient severity payload int he queue pipeline.
* Run the Severity predictor model.
* Update the severity in the central RDBMS.
* Clear the queue messenger
