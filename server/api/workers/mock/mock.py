from celery import Celery
import time
import logging
import os


logger = logging.getLogger(__name__)
app = Celery(__name__, broker="amqp://guest:guest@rabbitmq//")


def webhook_wrapper(func):
    def wraps(task, *args, **kwargs):
        import requests
        WEBHOOK_ENDPOINT = os.environ["WEBHOOK_ENDPOINT"]

        logger.warning(f"task {task.request.id}")

        def update(message):
            requests.post(WEBHOOK_ENDPOINT, json={
                "id": task.request.id,
                "state": "running",
                "error": None,
                "result": None,
                "message": message,
            })
        
        task.update = update

        requests.post(WEBHOOK_ENDPOINT, json={
            "id": task.request.id,
            "state": "running",
            "error": None,
            "result": None,
            "message": None,
        })

        try:
            result = func(task, *args, **kwargs)
        except Exception as e:
            requests.post(WEBHOOK_ENDPOINT, json={
                "id": task.request.id,
                "state": "failed",
                "error": f"{e}",
                "result": None,
                "message": None,
            })
            raise e
        else:
            requests.post(WEBHOOK_ENDPOINT, json={
                "id": task.request.id,
                "state": "success",
                "error": None,
                "result": result,
                "message": None,
            })

            return result

    return wraps

def is_prime(n):
    if n <= 1:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(n ** 0.5) + 1, 2):
        if n % i == 0:
            return False
    return True



@app.task(
    name="mock", 
    queue="mock_queue",
    bind=True
)
@webhook_wrapper
def mock(task, sleep_for):
    logger.info(f"received - {sleep_for}")
    
    def cpu_intensive_task(duration_seconds=20):
        start_time = time.time()
        num = 10**8  # Start from a large number

        while time.time() - start_time < duration_seconds:
            if is_prime(num):
                task.update(f"{num} is prime\n")
            num += 1

    cpu_intensive_task()
    return "OK"

