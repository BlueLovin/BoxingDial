from django.urls import path
from django.conf.urls import url
from . import views as fight_views

urlpatterns = [
    path("api/fights/", fight_views.FightsView.as_view()),
    url(r"api/fights/(?P<pk>[0-9]+)/$", fight_views.FightView.as_view()),
    path("api/fights/small", fight_views.SmallFightView.as_view()),
    path("api/fights/popular", fight_views.PopularFightsView.as_view()),
]
