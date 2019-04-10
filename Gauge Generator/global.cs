using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace Gauge_Generator
{
    public static class Global
    {
        public const float MIN_FLOAT_VALUE = 0.2f;
        public const float MAX_FLOAT_VALUE = 0.8f;
        public const float MIN_RANGE_VALUE = -500f;
        public const float MAX_RANGE_VALUE = 500f;
        public const int MAX_LAYERS = 30;
        
        public static ProjectData project = new ProjectData();

        public static Layer EditingLayer;

        private static Frame SidebarObject;
        private static Label SidebarTitleObject;
        public static SidebarPages Sidebar { get; private set; }

        public enum SidebarPages
        {
            Layers = 0,
            Editor = 1
        }

        public static void SetSidebarObject(Frame obj, Label lbl)
        {
            SidebarObject = obj;
            SidebarTitleObject = lbl;
        }

        public static void SetSidebar(SidebarPages newPage)
        {
            Sidebar = newPage;
            switch(Sidebar)
            {
                case SidebarPages.Layers:
                    SidebarObject.NavigationService.Navigate(new Layers_Page());
                    SidebarTitleObject.Content = "Layers";
                    break;
                case SidebarPages.Editor:
                    SidebarObject.NavigationService.Navigate(new Editor_Page());
                    SidebarTitleObject.Content = "Property editor";
                    break;
            }
        }
    }
}
