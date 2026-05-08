from django.urls import path

from . import views

urlpatterns = [
    path("billing/subscription", views.subscription),
    path("billing/invoices", views.invoices),
]
