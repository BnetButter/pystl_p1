import os
import celery
import logging
import time

logger = logging.getLogger(__name__)
app = celery.Celery(__name__, broker="amqp://guest:guest@rabbitmq//")


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

@app.task(
    name="aecif_worker", 
    queue="aecif_queue",
    bind=True
)
@webhook_wrapper
def main(task, input_files: list[str], output_dir: str):
    
    import os
    import cv2
    import numpy as np
    from PIL import Image
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))

    from AECIF_Net import HRnet_Segmentation

    hrnet = HRnet_Segmentation()
    dir_save_path_e   = f"{output_dir}/element"
    dir_save_path_d   = f"{output_dir}/defect"

    result = []


    for image_path in input_files:
        img_name = os.path.basename(image_path)
        print(img_name)
        if img_name.lower().endswith(('.bmp', '.dib', '.png', '.jpg', '.jpeg', '.pbm', '.pgm', '.ppm', '.tif', '.tiff')):
            image       = Image.open(image_path)
            r_image     = hrnet.detect_image(image)
            print(f"Processed Image {img_name}")
            task.update(f"Processed Image {img_name}\n")
            if not os.path.exists(dir_save_path_e):
                os.makedirs(dir_save_path_e)
            if not os.path.exists(dir_save_path_d):
                os.makedirs(dir_save_path_d)
            
            element = os.path.join(dir_save_path_e, img_name)
            defect = os.path.join(dir_save_path_d, img_name)
            r_image[0].save(os.path.join(dir_save_path_e, img_name))
            r_image[1].save(os.path.join(dir_save_path_d, img_name))
            result.append(element)
            result.append(defect)
    return result
  