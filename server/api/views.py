from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from api import models
from api import serializers
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from .serializers import MultiImageUploadSerializer, ImageSerializer
from django_filters.rest_framework import DjangoFilterBackend
import os
from django.conf import settings

class DefaultPagination(PageNumberPagination):
    page_size = 10  # Default
    page_size_query_param = 'page_size'  # Allow ?page_size=2
    max_page_size = 100  # Prevent very large page sizes

class HealthCheck(APIView):
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)

from api.workers.mock import mock
from api.workers.AECIF_NET import aecif_worker

class WorkerViewSet(ModelViewSet):
    queryset = models.Worker.objects.all()
    serializer_class = serializers.WorkerSerializer
    lookup_field = 'id'
    pagination_class = DefaultPagination

    @action(detail=False, methods=['post'])
    def mock(self, request):
        name = request.data.get("name")
        worker = models.Worker.objects.create(
            state="pending",
            error=None,
            result=None,
            message="",
            name=name,
            type="mock"
        )
        worker.save()
        async_result = mock.mock.apply_async(args=(5,), task_id=str(worker.id))
        return Response({"status": "ok", "task_id": async_result.id})
    
    @action(detail=False, methods=['post'])
    def aecifnet(self, request):
        name = request.data.get("name")
        datasetId = request.data.get("datasetId")

        image_query = (models.DatasetImage.objects
                  .filter(dataset=datasetId)
                  .values_list("image__file"))
        images = [ os.path.join(settings.MEDIA_ROOT, q[0]) for q in image_query ]
        

        worker = models.Worker.objects.create(
            state="pending",
            error=None,
            result=None,
            message="",
            name=name,
            type="aecifnet"
        )
        worker.save()
        async_result = aecif_worker.main.apply_async(args=(images, f"/media/{worker.id}"), task_id=str(worker.id))
        return Response({"status": "ok", "task_id": async_result.id})

    @action(detail=False, methods=["post"])
    def webhook(self, request):
        data = request.data

        task_id = data["id"]
        state = data["state"]
        error = data["error"]
        result = data["result"]
        message = data["message"]

        worker = models.Worker.objects.get(id=task_id)
        worker.state = state
        worker.error = error
        worker.result = result
        if message:
            worker.message += message

        worker.save()
        return Response({"message": "Webhook received"}, status=status.HTTP_200_OK)


class MultiImageUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = MultiImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            images = serializer.save()
            return Response(ImageSerializer(images, many=True).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DatasetViewSet(ModelViewSet):
    queryset = models.Dataset.objects.all()
    serializer_class = serializers.DatasetSerializer
    lookup_field = 'id'
    pagination_class = DefaultPagination

class ImagesViewSet(ModelViewSet):
    queryset = models.Image.objects.all()
    serializer_class = serializers.ImageSerializer
    lookup_field = 'id'
    pagination_class = DefaultPagination

class DatasetImageViewSet(ModelViewSet):
    queryset = models.DatasetImage.objects.all()
    serializer_class = serializers.DatasetImageSerializer
    lookup_field = 'id'
    pagination_class = DefaultPagination
    
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['dataset']  # Enables ?dataset=<uuid>