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
        public static string[] LayerNames = { "Range", "Linear Scale", "Numeric Scale", "Arc", "Label", "Gauge" };
        public static string[] LayerDescriptions = {
            "Range Range Range Range Range Range Range Range Range Range Range Range Range Range Range",
            "Linear Scale",
            "Numeric Scale",
            "Arc",
            "Label",
            "Gauge"
        };
        public static string[] LayerBigImages = {
            "pack://application:,,,/Images/range_item_big.png",
            "pack://application:,,,/Images/range_item_big.png",
            "pack://application:,,,/Images/range_item_big.png",
            "pack://application:,,,/Images/range_item_big.png",
            "pack://application:,,,/Images/range_item_big.png",
            "pack://application:,,,/Images/range_item_big.png"
        };
        public static string[] LayerSmallImages = {
            "pack://application:,,,/Images/range_item.png",
            "pack://application:,,,/Images/range_item.png",
            "pack://application:,,,/Images/range_item.png",
            "pack://application:,,,/Images/range_item.png",
            "pack://application:,,,/Images/range_item.png",
            "pack://application:,,,/Images/range_item.png"
        };

        private static Frame SidebarObject;
        private static Label SidebarTitleObject;
        public static SidebarPages Sidebar { get; private set; }

        public enum LayersType
        {
            Range = 0,
            LinearScale,
            NumericScale,
            Arc,
            Label,
            Gauge
        }

        public enum SidebarPages
        {
            Layers = 0,
            Editor,
            ProjectSettings
        }

        public static LayersType GetLayerType(Layer obj)
        {
            if (obj is Range_Item) return LayersType.Range;
            if (obj is LinearScale_Item) return LayersType.LinearScale;
            //TODO other types
            return LayersType.Range;
        }

        public static Type GetLayerObject(LayersType obj)
        {
            switch(obj)
            {
                case LayersType.Range:
                    return typeof(Range_Item);
                case LayersType.LinearScale:
                    return typeof(LinearScale_Item);
                    //TODO other types
                default:
                    return typeof(Range_Item);
            }
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
                case SidebarPages.ProjectSettings:
                    SidebarObject.NavigationService.Navigate(new Project_Settings_Page());
                    SidebarTitleObject.Content = "Project settings";
                    break;
            }
        }
    }
}
