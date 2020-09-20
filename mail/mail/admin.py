from django.contrib import admin

# Register your models here.
from .models import User, Email
# Register your models here.
class EmailAdmin(admin.ModelAdmin):
    list_display = ("user", "sender", "subject", "read", "archived")
    filter_horizontal = ("recipients",)
admin.site.register(User)
admin.site.register(Email, EmailAdmin)
