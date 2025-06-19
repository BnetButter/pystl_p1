from django.db import models
import uuid
# Create your models here.

class Worker(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    state = models.CharField(max_length=50)
    error = models.TextField(null=True, blank=True)
    result = models.JSONField(default=dict, null=True, blank=True)  # Use JSONField for JSON objects
    message = models.TextField()
    name = models.TextField(default="Worker")
    input_params = models.JSONField(default=dict, null=True, blank=True)
    type = models.CharField(max_length=50, default="mock")
    
    def __str__(self):
        return f"Worker {self.id} - {self.status}"


class Dataset(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField()

class Image(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ImageField(upload_to='images/')  # Store image locally in MEDIA_ROOT/images
    
class DatasetImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    image = models.ForeignKey(Image, on_delete=models.CASCADE)