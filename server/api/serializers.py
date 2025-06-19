from rest_framework import serializers
from .models import Image, DatasetImage, Dataset, Worker

class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = "__all__"


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = "__all__"


class MultiImageUploadSerializer(serializers.Serializer):
    images = serializers.ListField(
        child=serializers.ImageField(), write_only=True
    )
    dataset_id = serializers.UUIDField()

    def create(self, validated_data):
        dataset = Dataset.objects.get(id=validated_data['dataset_id'])
        image_instances = []

        for img in validated_data['images']:
            image = Image.objects.create(file=img)
            DatasetImage.objects.create(dataset=dataset, image=image)
            image_instances.append(image)
        
        return image_instances


class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = "__all__"
    
    image_count = serializers.SerializerMethodField()
    
    def get_image_count(self, obj):
        return DatasetImage.objects.filter(dataset=obj).count()
    


class DatasetImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = DatasetImage
        fields = "__all__"  # includes id, dataset, image
        # or: fields = ['id', 'dataset', 'image', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')  # needed for absolute URL
        if obj.image and obj.image.file:
            return request.build_absolute_uri(obj.image.file.url) if request else obj.image.file.url
        return None
