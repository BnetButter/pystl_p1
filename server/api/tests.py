# Create your tests here.from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from rest_framework.test import APITestCase
from api import models
from io import BytesIO
from PIL import Image as PILImage
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from .models import Dataset


class HealthCheckTest(APITestCase):
    def test_health_check_returns_ok(self):
        url = reverse('healthcheck')  # uses name='healthcheck' from urls.py
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"status": "ok"})


class WorkerViewSetTests(APITestCase):
    def test_mock_action(self):
        url = reverse('worker-mock')  # DRF auto-generates this name from the @action
        response = self.client.post(url, {
            "name": "test mock"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")

    def test_worker_webhook(self):
        url = reverse('worker-webhook')
        worker = models.Worker.objects.create(
            state="pending",
            error=None,
            result=None,
            message="",
        )
        worker.save()
        
        response = self.client.post(url, {
            "id": str(worker.id),
            "state": "running",
            "error": None,
            "result": None,
            "message": "hello world!"
        }, format="json")

        self.assertEqual(response.status_code, 200)

        worker = models.Worker.objects.get(id=str(worker.id))
        self.assertEqual(worker.message, "hello world!")
        self.assertEqual(worker.state, "running")
        
        
        response = self.client.post(url, {
            "id": str(worker.id),
            "state": "running",
            "error": None,
            "result": None,
            "message": "hello world!"
        }, format="json")

        worker = models.Worker.objects.get(id=str(worker.id))
        self.assertEqual(worker.message, "hello world!hello world!")
    


class TestDataset(APITestCase):

    def setUp(self):
        self.client = APIClient()
    
    def test_create_dataset(self):
        response = self.client.post(reverse("datasets-list"), {
            "name": "Test Dataset"
        })
        self.assertEqual(response.status_code, 201)
        get_response = self.client.get(reverse("datasets-list"))
        data = get_response.data
        self.assertEqual(data['count'], 1)
        


class ImageUploadTest(APITestCase):

    def generate_test_image_file(self, name="test.jpg", size=(100, 100), color=(255, 0, 0)):
        image = PILImage.new("RGB", size, color)
        stream = BytesIO()
        image.save(stream, format='JPEG')
        stream.seek(0)
        return SimpleUploadedFile(name, stream.read(), content_type="image/jpeg")

    def test_upload_image_to_dataset(self):
        # Create a test dataset
        dataset = Dataset.objects.create(name="Test Dataset")

        # Generate test image
        img_file = self.generate_test_image_file()

        # Make POST request to your upload endpoint
        url = reverse('upload-images')  # make sure this name matches your urlpatterns
        data = {
            "dataset_id": str(dataset.id),
            "images": [img_file],
        }

        client = APIClient()
        response = client.post(url, data, format='multipart')

        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.data[0])  # Check that an image was uploaded

        response = client.get(reverse('datasets-list'))
        self.assertEqual(response.data['results'][0]['image_count'], 1)

