"""
URL configuration for server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from api import views
from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'worker', views.WorkerViewSet, basename="worker")
router.register(r'images', views.ImagesViewSet, basename="images")
router.register(r'datasets', views.DatasetViewSet, basename="datasets")
router.register(r'dataset-image', views.DatasetImageViewSet, basename="dataset-image")

urlpatterns = [
    path('services/api/', include(router.urls)),
    path('services/api/healthcheck/', views.HealthCheck.as_view(), name="healthcheck"),
    path('services/admin/', admin.site.urls),
    path('services/api/upload-images/', views.MultiImageUploadView.as_view(), name='upload-images'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

