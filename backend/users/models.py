from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    streak = models.IntegerField(default=0)
    personal_best = models.IntegerField(default=0)
    last_check_in = models.DateField(null=True, blank=True)
    
    # AI Insight Caching
    ai_insight = models.TextField(null=True, blank=True)
    ai_remedy = models.TextField(null=True, blank=True)
    insight_generated_at = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
